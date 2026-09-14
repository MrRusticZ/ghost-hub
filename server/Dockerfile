FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY shared ./shared
COPY public/data/hub-catalog.json ./public/data/hub-catalog.json
RUN mkdir -p /app/runtime && chown -R node:node /app
USER node
ENV HOST=0.0.0.0 PORT=4387 DATA_DIR=/app/runtime
EXPOSE 4387
VOLUME ["/app/runtime"]
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:4387/api/status').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","server/index.mjs"]
