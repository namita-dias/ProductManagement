import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';
import { ProductDatabaseConstruct } from './databaseApi';

export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new ProductDatabaseConstruct(this, 'ProductDatabaseAPI');
    cdk.Tags.of(database).add('Module', 'Database');
  }
}
