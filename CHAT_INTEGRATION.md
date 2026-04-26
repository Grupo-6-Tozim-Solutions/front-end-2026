## 🚀 Integração Chat IA - Guia de Uso

A integração do chat de IA com o backend foi implementada com suporte completo a **mensagens de texto** e **áudio**.

### 📋 Componentes Criados/Modificados

#### 1. **Tipos (`src/types/chat.ts`)**
- `ChatRequest` - Payload de requisição (mensagem ou áudio base64)
- `ChatResponse` - Payload de resposta (user_input, ai_response, context_used)
- `ChatMessage` - Estrutura de mensagem com suporte a áudio e texto

#### 2. **Serviço de Chat (`src/services/chatService.ts`)**
Fornece 4 funções principais:

```typescript
// 1. Enviar mensagem de texto
sendChatMessage(message: string): Promise<ChatResponse>

// 2. Enviar áudio em base64
sendChatAudio(audioBase64: string, audioFilename: string): Promise<ChatResponse>

// 3. Enviar áudio via multipart/form-data
sendChatAudioFile(audioUri: string, message?: string): Promise<ChatResponse>

// 4. Processar chat (texto ou áudio com fallback)
processChat(message?: string, audioBase64?: string, audioFilename?: string): Promise<ChatResponse>
```

#### 3. **SleepCoachScreen Atualizado (`src/screens/SleepCoachScreen.tsx`)**
- ✅ `handleSendMessage()` - Integrado com `sendChatMessage()`
- ✅ `handleSendAudio()` - Integrado com `sendChatAudio()`
- ✅ Removidas respostas mock, agora usa respostas reais da IA

---

### 📡 Endpoints de Integração

O backend expõe dois endpoints para chat:

#### `POST /chat/message`
**Uso:** Enviar mensagem de texto ou áudio em base64

```typescript
const request: ChatRequest = {
  message?: string;        // Texto do usuário
  audio_base64?: string;   // Áudio codificado em base64
  audio_filename?: string; // Nome do arquivo (ex: "audio.m4a")
};

const response: ChatResponse = {
  user_input: string;           // Entrada processada
  ai_response: string;          // Resposta da IA
  context_used?: Record<...>;   // Contexto/dados usados
};
```

#### `POST /chat/message-multipart`
**Uso:** Enviar áudio como arquivo (multipart/form-data)

```typescript
FormData:
  - audio: File (arquivo de áudio)
  - message?: string (opcional, para texto adicional)

Response: ChatResponse (mesmo formato)
```

---

### 💻 Exemplos de Uso

#### Exemplo 1: Enviar Mensagem de Texto
```typescript
import { sendChatMessage } from '../services/chatService';

const response = await sendChatMessage("Como melhorar meu sono?");
console.log(response.ai_response); // Resposta da IA
```

#### Exemplo 2: Enviar Áudio (Base64)
```typescript
import { sendChatAudio } from '../services/chatService';
import * as FileSystem from 'expo-file-system';

// Ler arquivo de áudio e converter para base64
const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
  encoding: FileSystem.EncodingType.Base64,
});

const response = await sendChatAudio(audioBase64, 'audio.m4a');
console.log(response.user_input);  // Transcrição do áudio
console.log(response.ai_response); // Resposta da IA
```

#### Exemplo 3: Enviar Áudio (Multipart)
```typescript
import { sendChatAudioFile } from '../services/chatService';

const response = await sendChatAudioFile(audioUri, "Meu sono está pior");
console.log(response.ai_response); // Resposta da IA processando o áudio + texto
```

---

### 🔄 Fluxo de Integração no SleepCoachScreen

1. **Usuário envia mensagem de texto:**
   - `handleSendMessage()` chamada
   - Mensagem adicionada ao estado de mensagens
   - `sendChatMessage()` chamada
   - Resposta da IA exibida como nova mensagem

2. **Usuário envia áudio:**
   - `handleStopRecording()` chamada após gravação
   - Áudio convertido para base64 usando `FileSystem.readAsStringAsync()`
   - `handleSendAudio()` chamada
   - `sendChatAudio()` chamada com base64
   - Resposta da IA exibida com transcrição do áudio

---

### ⚠️ Tratamento de Erros

Todos os serviços possuem try-catch e disparam `Alert` ao usuário com mensagem amigável:

```typescript
try {
  const response = await sendChatMessage(message);
} catch (error) {
  Alert.alert('Erro ao enviar mensagem', error.message);
}
```

Mensagens de erro:
- "Erro ao enviar mensagem para o chat"
- "Erro ao enviar áudio para o chat"
- "Nenhuma mensagem de texto ou áudio foi fornecido"

---

### 📝 Configuração Required

Certifique-se que no `src/services/client.ts`:
- O `api` cliente está configurado com a URL base correta do backend
- Headers necessários estão definidos

Exemplo esperado:
```typescript
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

### 🧪 Testando a Integração

1. **Teste de Mensagem de Texto:**
   - Abra o app no SleepCoachScreen
   - Digite uma pergunta sobre sono
   - Clique em enviar (→)
   - Deve receber resposta da IA em tempo real

2. **Teste de Áudio:**
   - Clique no ícone de microfone (🎙️)
   - Conceda permissão de microfone
   - Grave uma mensagem
   - Clique em ✓ para enviar
   - Deve receber transcrição + resposta da IA

---

### 🐛 Debug

Ative logs detalhados via variável de ambiente:
```
EXPO_PUBLIC_SHOW_LOG_PREFIX=true
```

Isso exibirá logs como:
```
[ChatService] Sending text message...
[ChatService] Message response received: {...}
```

---

### 📚 Próximas Melhorias

- [ ] Persistir histórico de chat em AsyncStorage
- [ ] Integrar histórico no context (AppContext)
- [ ] Adicionar retry automático em caso de falha
- [ ] Cache de respostas frequentes
- [ ] Suporte a voice output (TTS) para respostas da IA
