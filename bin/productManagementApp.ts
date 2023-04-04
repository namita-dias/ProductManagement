#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductManagementStack } from '../resources/product-application-stack';

const app = new cdk.App();
new ProductManagementStack(app, 'ProductManagementStack');
