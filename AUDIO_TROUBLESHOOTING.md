## 🔍 Troubleshooting - Erro 500 ao Enviar Áudio

### Problema
O frontend está enviando áudio com sucesso, mas o backend retorna erro 500 "falha interna não prevista".

### Solução - Verificar Logs do Backend

**1. Veja os logs do backend:**
   - Abra o terminal onde o backend está rodando
   - Procure por mensagens de erro ao enviar áudio
   - Copie a **stack trace completa** do erro

**2. Possíveis causas:**

#### a) Dependência de Transcrição Faltando
```
ModuleNotFoundError: No module named 'google.cloud.speech'
```
**Solução:** Instale as dependências
```bash
pip install google-cloud-speech
```

#### b) Credenciais do Google Cloud não configuradas
```
Error: Could not automatically determine credentials
```
**Solução:** Configure a variável de ambiente
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/service-account.json"
```

#### c) Arquivo de Áudio Corrompido
```
Error processing audio file
```
**Solução:** Verifique se o arquivo está em formato m4a válido

#### d) Timeout na Transcrição
```
Transcrição levou mais tempo do que o esperado
```
**Solução:** Aumentar timeout no backend (já feito: 2x do timeout_seconds)

### Como Compartilhar o Erro

1. **Copie a stack trace completa** do erro do backend
2. **Compartilhe também:**
   - Tamanho do arquivo de áudio (em bytes)
   - Duração do áudio em segundos
   - Sistema operacional do backend (Windows/Linux/Mac)

### Checklist do Backend

- [ ] Backend está rodando em `http://192.168.0.19:8000`
- [ ] Endpoint `/chat/message` está acessível
- [ ] Dependências de IA estão instaladas
- [ ] Credenciais do Google Cloud estão configuradas
- [ ] Permissões de arquivo estão corretas
- [ ] Timeout de transcrição é suficiente

### Teste Rápido (cURL)

Para testar o endpoint diretamente:

```bash
# 1. Primeiro teste com mensagem de texto
curl -X POST "http://192.168.0.19:8000/chat/message" \
  -H "Content-Type: application/json" \
  -d '{"message": "teste"}'

# 2. Se funcionar, teste com áudio pequeno (convertido para base64)
# Precisa de um arquivo de áudio em base64
curl -X POST "http://192.168.0.19:8000/chat/message" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_base64": "SUQzBAAAI1RTU0UAAAAPAAADTGF2Zj9...",
    "audio_filename": "test.m4a"
  }'
```

### Debug Frontend

Se precisar mais detalhes do lado do frontend, habilite logs completos:

```bash
# No .env
EXPO_PUBLIC_SHOW_LOG_PREFIX=true
```

Então teste novamente e compartilhe todos os logs que aparecerem.
