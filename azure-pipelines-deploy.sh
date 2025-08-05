echo "**** Build do Backend no Docker ****"
docker compose build --no-cache

echo "**** Iniciando docker ****"
docker compose up