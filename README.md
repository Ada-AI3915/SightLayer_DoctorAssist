# Doctor Assist

## Chatbot Service

- Create chatbot-service/.env file with chatbot-service/.env.example

- Docker build and run service

```
cd chatbot-service
docker build -t doctor-assist-chatbot-service .
docker run -p 3002:3002 doctor-assist-chatbot-service
```

## Socket Service

- Create socket-service/.env file with socket-service/.env.example

- Docker build and run service

```
cd socket-service
docker build -t doctor-assist-socket-service .
docker run -p 3001:3001 doctor-assist-socket-service
```

## Frontend

- Create frontend/config.json file with frontend/config.example.json

- Docker build and run service

```
cd frontend
docker build -t doctor-assist-frontend .
docker run -p 3000:3000 doctor-assist-frontend
```

## You can access service via http://127.0.0.1:3000!!!