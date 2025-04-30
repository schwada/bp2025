prerequisites: docker registry - local


sudo docker build -f ./server/Dockerfile -t bp-server:latest .
sudo docker build -f ./database/.Dockerfile -t bp-database:latest .

docker-compose build
docker-compose push

kubectl apply -f deployment/



sudo k3s kubectl delete all --all -n bp-app