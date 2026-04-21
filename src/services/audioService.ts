import * as FileSystem from 'expo-file-system';
import { Audio, AVPlaybackStatus } from 'expo-av';

/**
 * Service para gravar e gerenciar áudios reais
 * - Gravação de áudio via expo-av
 * - Playback de áudio via expo-av
 * - Gerenciamento de permissões
 */

export interface AudioRecording {
  id: string;
  uri: string;
  duration: number; // em ms
  createdAt: number;
}

export interface AudioPlayback {
  isPlaying: boolean;
  currentTime: number; // em ms
  duration: number; // em ms
}

// Estado global de gravação
let currentRecording: Audio.Recording | null = null;
let recordingStartTime: number = 0;

// Estado global de playback
let currentPlayingAudioId: string | null = null;
let playbackState: Map<string, AudioPlayback> = new Map();
let soundInstances: Map<string, Audio.Sound> = new Map();
let playbackUpdateIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

export const audioService = {
  /**
   * Inicia gravação de áudio real via expo-av
   */
  async startRecording(): Promise<boolean> {
    try {
      console.log('[Audio] Starting recording...');

      // Parar gravação anterior se houver
      if (currentRecording) {
        await currentRecording.stopAndUnloadAsync();
      }

      // Configurar modo de áudio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Criar nova gravação
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      currentRecording = recording;
      recordingStartTime = Date.now();

      console.log('[Audio] Recording started successfully');
      return true;
    } catch (error) {
      console.error('[Audio] Error starting recording:', error);
      return false;
    }
  },

  /**
   * Para a gravação e retorna o arquivo de áudio gravado
   */
  async stopRecording(): Promise<AudioRecording | null> {
    try {
      if (!currentRecording) {
        console.warn('[Audio] No recording in progress');
        return null;
      }

      console.log('[Audio] Stopping recording...');
      await currentRecording.stopAndUnloadAsync();

      // Obter informações da gravação
      const uri = currentRecording.getURI();
      if (!uri) {
        console.error('[Audio] No URI returned from recording');
        return null;
      }

      const duration = Date.now() - recordingStartTime;

      const recording: AudioRecording = {
        id: `audio_${Date.now()}`,
        uri: uri,
        duration: duration,
        createdAt: Date.now(),
      };

      console.log('[Audio] Recording stopped. Duration:', duration, 'ms');
      console.log('[Audio] Audio file uri:', uri);

      currentRecording = null;
      recordingStartTime = 0;

      return recording;
    } catch (error) {
      console.error('[Audio] Error stopping recording:', error);
      currentRecording = null;
      recordingStartTime = 0;
      return null;
    }
  },

  /**
   * Cancela a gravação em progresso
   */
  async cancelRecording(): Promise<void> {
    try {
      if (!currentRecording) {
        console.warn('[Audio] No recording in progress');
        return;
      }

      console.log('[Audio] Canceling recording...');
      await currentRecording.stopAndUnloadAsync();
      
      // Deletar arquivo de gravação
      const uri = currentRecording.getURI();
      if (uri) {
        await audioService.deleteAudio(uri);
      }

      currentRecording = null;
      recordingStartTime = 0;

      console.log('[Audio] Recording canceled');
    } catch (error) {
      console.error('[Audio] Error canceling recording:', error);
      currentRecording = null;
      recordingStartTime = 0;
    }
  },

  /**
   * Deleta um arquivo de áudio
   */
  async deleteAudio(uri: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri);
        console.log('[Audio] Audio file deleted:', uri);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Audio] Error deleting audio:', error);
      return false;
    }
  },

  /**
   * Formata a duração do áudio em formato legível (00:00)
   */
  formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  },

  /**
   * Calcula o tamanho aproximado do arquivo em MB
   */
  estimateFileSize(durationMs: number, bitrate: number = 128000): number {
    // bitrate padrão: 128 kbps
    return (durationMs / 1000) * (bitrate / 8) / (1024 * 1024);
  },

  /**
   * Valida se o áudio é válido para envio
   */
  isValidAudio(recording: AudioRecording): boolean {
    // Mínimo 1 segundo, máximo 5 minutos
    const minDuration = 1000; // 1 segundo
    const maxDuration = 5 * 60 * 1000; // 5 minutos

    if (recording.duration < minDuration) {
      console.warn('[Audio] Recording too short. Minimum: 1 second');
      return false;
    }

    if (recording.duration > maxDuration) {
      console.warn('[Audio] Recording too long. Maximum: 5 minutes');
      return false;
    }

    return true;
  },

  /**
   * Obtém informações sobre o uso de espaço de áudio
   */
  async getAudioStorageInfo(): Promise<{ used: number; available: number }> {
    try {
      const documentDir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? null;
      if (!documentDir) {
        return { used: 0, available: 0 };
      }

      const files = await FileSystem.readDirectoryAsync(documentDir);
      const audioFiles = files.filter((f) => f.endsWith('.wav') || f.endsWith('.m4a'));

      let totalSize = 0;
      for (const file of audioFiles) {
        const fileInfo = await FileSystem.getInfoAsync(`${documentDir}${file}`);
        const size = (fileInfo as any).size;
        if (fileInfo.exists && typeof size === 'number') {
          totalSize += size;
        }
      }

      return {
        used: totalSize / (1024 * 1024), // MB
        available: 50, // Assume 50MB storage limit
      };
    } catch (error) {
      console.error('[Audio] Error getting storage info:', error);
      return { used: 0, available: 50 };
    }
  },

  /**
   * Limpa áudios antigos (mais de 7 dias)
   */
  async cleanupOldAudios(): Promise<number> {
    try {
      const documentDir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? null;
      if (!documentDir) return 0;

      const files = await FileSystem.readDirectoryAsync(documentDir);
      const audioFiles = files.filter((f) => f.endsWith('.wav') || f.endsWith('.m4a'));

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      let deleted = 0;

      for (const file of audioFiles) {
        const fileInfo = await FileSystem.getInfoAsync(`${documentDir}${file}`);
        const modTime = (fileInfo as any).modificationTime;
        if (fileInfo.exists && typeof modTime === 'number' && modTime < sevenDaysAgo) {
          await FileSystem.deleteAsync(`${documentDir}${file}`);
          deleted++;
        }
      }

      console.log('[Audio] Cleaned up', deleted, 'old audio files');
      return deleted;
    } catch (error) {
      console.error('[Audio] Error cleaning up old audios:', error);
      return 0;
    }
  },

  /**
   * Inicia a reprodução de um áudio real via expo-av
   */
  async playAudio(audioId: string, uri: string, duration: number): Promise<boolean> {
    try {
      console.log('[Audio] Playing audio:', audioId, 'from:', uri);

      // Se há outro áudio tocando, para ele
      if (currentPlayingAudioId && currentPlayingAudioId !== audioId) {
        await audioService.stopAudio(currentPlayingAudioId);
      }

      currentPlayingAudioId = audioId;

      // Parar intervalo anterior se houver
      if (playbackUpdateIntervals.has(audioId)) {
        clearInterval(playbackUpdateIntervals.get(audioId)!);
        playbackUpdateIntervals.delete(audioId);
      }

      // Criar ou reutilizar instância de Sound
      let sound = soundInstances.get(audioId);
      if (!sound) {
        sound = new Audio.Sound();
        soundInstances.set(audioId, sound);
      }

      // Carregar áudio
      await sound.loadAsync({ uri });

      // Inicializar estado de playback
      if (!playbackState.has(audioId)) {
        playbackState.set(audioId, {
          isPlaying: true,
          currentTime: 0,
          duration: duration,
        });
      } else {
        const state = playbackState.get(audioId)!;
        state.isPlaying = true;
        state.currentTime = 0;
      }

      // Configurar callback quando áudio termina
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          const state = playbackState.get(audioId);
          if (state) {
            state.currentTime = status.positionMillis || 0;
            state.isPlaying = status.isPlaying;

            // Se terminou de tocar
            if (status.didJustFinish) {
              state.isPlaying = false;
              state.currentTime = 0;
              if (currentPlayingAudioId === audioId) {
                currentPlayingAudioId = null;
              }
            }
          }
        } else if (status.error) {
          console.error('[Audio] Playback error:', status.error);
        }
      });

      // Começar playback
      await sound.playAsync();

      // Atualizar estado com intervalo
      const interval = setInterval(async () => {
        const state = playbackState.get(audioId);
        if (state && state.isPlaying) {
          try {
            const status = await sound?.getStatusAsync();
            if (status?.isLoaded) {
              state.currentTime = status.positionMillis || 0;
            }
          } catch (error) {
            console.error('[Audio] Error updating playback status:', error);
          }
        }
      }, 100);

      playbackUpdateIntervals.set(audioId, interval);

      console.log('[Audio] Playback started');
      return true;
    } catch (error) {
      console.error('[Audio] Error playing audio:', error);
      if (currentPlayingAudioId === audioId) {
        currentPlayingAudioId = null;
      }
      return false;
    }
  },

  /**
   * Pausa a reprodução de um áudio
   */
  async pauseAudio(audioId: string): Promise<boolean> {
    try {
      const sound = soundInstances.get(audioId);
      const state = playbackState.get(audioId);

      if (!sound || !state) {
        console.warn('[Audio] Audio not found:', audioId);
        return false;
      }

      await sound.pauseAsync();
      state.isPlaying = false;

      console.log('[Audio] Paused audio:', audioId);
      return true;
    } catch (error) {
      console.error('[Audio] Error pausing audio:', error);
      return false;
    }
  },

  /**
   * Para a reprodução e reseta para o início
   */
  async stopAudio(audioId: string): Promise<boolean> {
    try {
      const sound = soundInstances.get(audioId);
      const state = playbackState.get(audioId);

      if (!sound || !state) {
        console.warn('[Audio] Audio not found:', audioId);
        return false;
      }

      // Parar intervalo de atualização
      const interval = playbackUpdateIntervals.get(audioId);
      if (interval) {
        clearInterval(interval);
        playbackUpdateIntervals.delete(audioId);
      }

      // Parar som e descarregar
      await sound.stopAsync();
      await sound.unloadAsync();

      state.isPlaying = false;
      state.currentTime = 0;

      soundInstances.delete(audioId);

      if (currentPlayingAudioId === audioId) {
        currentPlayingAudioId = null;
      }

      console.log('[Audio] Stopped audio:', audioId);
      return true;
    } catch (error) {
      console.error('[Audio] Error stopping audio:', error);
      return false;
    }
  },

  /**
   * Obtém o estado atual de playback
   */
  getPlaybackState(audioId: string): AudioPlayback | null {
    return playbackState.get(audioId) || null;
  },

  /**
   * Define o tempo de reprodução (seek)
   */
  async seekAudio(audioId: string, timeMs: number): Promise<boolean> {
    try {
      const sound = soundInstances.get(audioId);
      const state = playbackState.get(audioId);

      if (!sound || !state) {
        console.warn('[Audio] Audio not found:', audioId);
        return false;
      }

      const seekTime = Math.max(0, Math.min(timeMs, state.duration));
      await sound.setPositionAsync(seekTime);
      state.currentTime = seekTime;

      console.log('[Audio] Seeked to:', seekTime, 'ms');
      return true;
    } catch (error) {
      console.error('[Audio] Error seeking audio:', error);
      return false;
    }
  },

  /**
   * Limpa o estado de playback e libera recursos
   */
  async clearPlaybackState(): Promise<void> {
    try {
      // Parar todos os intervalos
      playbackUpdateIntervals.forEach((interval) => clearInterval(interval));
      playbackUpdateIntervals.clear();

      // Descarregar todos os sons
      for (const [audioId, sound] of soundInstances) {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.error(`[Audio] Error unloading sound ${audioId}:`, error);
        }
      }

      soundInstances.clear();
      playbackState.clear();
      currentPlayingAudioId = null;

      console.log('[Audio] Playback state cleared');
    } catch (error) {
      console.error('[Audio] Error clearing playback state:', error);
    }
  },
};

