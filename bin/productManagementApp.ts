#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductManagementStack } from '../lib/productManagementStack';

const app = new cdk.App();
new ProductManagementStack(app, 'ProductManagementStack');