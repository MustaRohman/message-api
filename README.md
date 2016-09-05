# message-api
RESTful api for chat applications

# Testing (Easier with Postman)
1. POST /users (body - email and password) x 2 (One for recipient)
2. POST /users/login (body - email and password)
3. Copy and paste Auth value from response header into request header for next requests
4. POST /conversations (body - recipient user) 
5. POST /messages (body - text and comversationId (from response body in previous request)
