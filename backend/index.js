const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');


const uploadRoute = require('./src/routes/uploadRoute');
const userRoute = require('./src/routes/userRoute');
const gachaRoute = require('./src/routes/gachaRoute');
const deliveryProofRoute = require('./src/routes/deliveryProofRoute');
const shippingRoute = require('./src/routes/shippingRoute');
const itemRoute = require('./src/routes/itemRoute'); 
const nftRoute = require('./src/routes/nftRoute');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(morgan('dev'));


const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'NFT 실물 가챠 API',
        version: '1.0.0',
        description: '사용자 + NFT + 배송 등 API 문서',
      },
      servers: [{ url: 'http://localhost:3000' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js'],
  };
  
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.use('/api/users', userRoute);
app.use('/api/upload', uploadRoute);
app.use('/uploads', express.static('uploads'));
app.use('/api/gacha', gachaRoute);
app.use('/api/delivery', deliveryProofRoute);
app.use('/api/shippings', shippingRoute);
app.use('/api/items', itemRoute); 
app.use('/api/nft', nftRoute);


// 기본 라우트
app.get('/', (req, res) => {
  res.send('🚀 NFT 실물 가챠 API 서버가 실행 중입니다!');
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행됨: http://localhost:${PORT}`);
});