#!/usr/bin/env bash
set -euo pipefail

repo_dir=/opt/apps/bep-du-banh/repo
config_dir=/opt/apps/bep-du-banh/config
env_file="$config_dir/.env"
placeholder=thay-bang-mat-khau-database-dai-va-ngau-nhien

if [[ -e "$env_file" ]]; then
  printf 'Đã có %s; không ghi đè cấu hình hiện tại.\n' "$env_file" >&2
  exit 1
fi

install -d -m 700 "$config_dir"
umask 077
cp "$repo_dir/deploy/oracle/.env.example" "$env_file"
db_password=$(openssl rand -hex 32)
sed -i "s/$placeholder/$db_password/g" "$env_file"
if grep -q "$placeholder" "$env_file"; then
  printf 'Không thay được mật khẩu mẫu; cần kiểm tra cấu hình.\n' >&2
  exit 1
fi
chmod 600 "$env_file"
printf 'Đã tạo %s với mật khẩu database riêng. SMTP và ZaloPay vẫn để trống.\n' "$env_file"
