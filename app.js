const axios = require('axios');

const dotenv = require('dotenv');
dotenv.config()

const shopDomain = process.env.SHOP_DOMAIN;
const accessToken = process.env.ACCESS_TOKEN;
const apiVersion = process.env.API_VERSION;

async function getDataFromAPI(query) {
  try {
    const response = await axios({
      method: 'post',
      url: `https://${shopDomain}.myshopify.com/admin/api/${apiVersion}/graphql.json`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
      data: { query },
    });
    return response.data
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}


async function showOrdersAndProducts() {
  const orderQuery = `
    query ($pageCursor: String) {
      orders(first: 5, query: "created_at:2022-12-12T00:00:00Z..2022-12-29T23:59:59Z", after: $pageCursor, sortKey: CREATED_AT, reverse: false) {
        edges {
          node {
            id
            name
            createdAt
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
`
  const productQuery = `
    query {
      products(first: 100, sortKey: TITLE, reverse: false) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
    `

  const ordersData = await getDataFromAPI(orderQuery)

  const orders = ordersData.data.orders.edges;
  if (orders.length === 0) {
    console.log("No orders found in the mentioned time range")
  }
  orders.forEach(order => {
    console.log(`Order ID: ${order.node.id} | Name: ${order.node.name} | Created At: ${order.node.createdAt}`);
  });

  const productsData = await getDataFromAPI(productQuery)
  const products = productsData.data.products.edges
  products.forEach(product => {
    console.log(`Product ID: ${product.node.id} | Name: ${product.node.title}`);
  });
}


showOrdersAndProducts()