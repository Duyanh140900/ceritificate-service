# Sử dụng image Node.js chính thức làm base
FROM node:16

# Cài đặt các phụ thuộc hệ thống để hỗ trợ font
RUN apt-get update && apt-get install -y \
    libjpeg-dev \
    libpango1.0-dev \
    libcairo2-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Nếu bạn có font riêng, có thể sao chép font vào container
COPY ./fonts /usr/share/fonts/truetype/

# Cập nhật font cache
RUN fc-cache -f -v

# Tạo thư mục ứng dụng trong container
WORKDIR /app

# Sao chép package.json và cài đặt các dependencies
COPY package*.json ./
RUN npm install

# Sao chép phần còn lại của mã nguồn ứng dụng vào container
COPY . .

# Expose port ứng dụng (nếu có)
EXPOSE 3001

# Chạy ứng dụng
CMD ["npm", "run", "dev"]
