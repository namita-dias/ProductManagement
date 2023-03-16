import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';

export interface ProductDatabaseProps {

}

export class ProductDatabaseConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ProductDatabaseProps) {
    super(scope, id);

      const productTable = new dynamo.Table(this, 'Product', {
          partitionKey: { name: 'ProductId', type: dynamo.AttributeType.STRING },
          billingMode: dynamo.BillingMode.PAY_PER_REQUEST
      });

      const productTableName = productTable.tableName;
      new cdk.CfnOutput(this, "ProductTableName", {
          value: productTableName,
          exportName: "ProductTableName"
      });
  }
}