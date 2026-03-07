# ---- 构建阶段 ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ---- 运行阶段 ----
FROM nginx:1.27-alpine

# 复制前端构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 配置（支持 Vue Router history 模式，并代理 /api /proxy 到 backend-proxy）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
