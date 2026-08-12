# Set DeepSeek API key for the Pages chat gateway (pages.dev, CN-reachable):
#   cd workers/signal-chat-gateway
#   npx wrangler pages secret put DEEPSEEK_API_KEY --project-name=nafyoung-chat
#
# Optional local override for the site frontend:
#   VITE_SIGNAL_CHAT_URL=https://nafyoung-chat.pages.dev/api/chat
