import * as products from '../../implementation/products';

describe('Testing the operations on products', () => {
  test('sendFail - it should display route error when route not resolved', async () => {
    const event: any = {
      resource: '/products/{Name}',
      httpMethod: 'GET',
    };

    const result = await products.productHandler(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('unsupported route');
  });
});
