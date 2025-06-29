# 1. Imagen base
FROM node:22.14.0

# 2. Directorio de trabajo
WORKDIR /app

# 3. Copia dependencias
COPY package*.json ./
COPY .env ./
RUN npm install

# 4. Copia el resto del código
COPY . .

# 5. Exponer el puerto
EXPOSE 5173

# 6. Comando de arranque
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

