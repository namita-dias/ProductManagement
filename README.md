This is a simple app that performs CRUD opeartions on the DynamoDB table via a API. The cdk stack constsis of creating a table, creating a lambda that # # calls the handler to perform CRUD operations and a APIGateway to create the REST APIs. The code is deployed through a github workflow to AWS. The AWS resources are deployed using CDK and github workflows.

 1. List all products:
   https://g3e5dthht4.execute-api.eu-west-2.amazonaws.com/prod/products

2. Add products:
   https://g3e5dthht4.execute-api.eu-west-2.amazonaws.com/prod/products
   Eg:
      ```
      {
         "name" : "Product F",
         "price" : "60.00"
      }
      ```

3. Details of one product:
   https://g3e5dthht4.execute-api.eu-west-2.amazonaws.com/prod/products/{producId}

4. Update product:
   https://g3e5dthht4.execute-api.eu-west-2.amazonaws.com/prod/products
   Eg:
      ```
      {
         "createDate": "2023-04-04T12:19:57.186Z",
         "price": "70.00",
         "name": "Product F",
         "productId": "89976337-d268-4464-9b9e-8f3b58881aeb"
      }
      ```
5. Delete product:
   https://g3e5dthht4.execute-api.eu-west-2.amazonaws.com/prod/products/{productId}
