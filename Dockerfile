FROM chiskat/baseline-node24-puppeteer:2026.6.8

WORKDIR /paperplane.cc
EXPOSE 3000

ENV NODE_ENV=production
ENV DO_NOT_TRACK=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV TZ=Asia/Shanghai

RUN pnpm add -g dotenv-cli

COPY .next/standalone ./

CMD ["dotenv", "-e", ".env.production.local", "-e", ".env.production", "--", "node", "server.js"]
