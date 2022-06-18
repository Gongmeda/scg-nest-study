import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { ProductsModule } from '../src/products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ProductsModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '1234',
          database: 'nest',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
          logging: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.get<DataSource>(DataSource).dropDatabase();
  });

  describe('/products (POST)', () => {
    it('유효한 제품을 등록할 수 있다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          price: 10000,
          description: 'valid description',
        })
        .expect(201);
    });

    it('등록 요청한 제품 이름 없을 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          price: 10000,
          description: 'valid description',
        })
        .expect(400);
    });

    it('등록 요청한 제품 이름이 이미 존재하는 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'duplicate name',
          price: 10000,
          description: 'valid description1',
        })
        .then(() => {
          return request(app.getHttpServer())
            .post('/products')
            .send({
              name: 'duplicate name',
              price: 1000,
              description: 'valid description2',
            })
            .expect(409);
        });
    });

    it('등록 요청한 제품 이름이 문자열이 아닐 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: expect.any(String).not,
          price: 10000,
          description: 'valid description',
        })
        .expect(400);
    });

    it('등록 요청한 제품 이름 길이가 빈칸 없이 2 미만이면 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'a',
          price: 10000,
          description: 'valid description',
        })
        .expect(400);
    });

    it('등록 요청한 제품 이름 길이가 20 초과면 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'a'.repeat(21),
          price: 10000,
          description: 'valid description',
        })
        .expect(400);
    });

    it('등록 요청한 제품 가격이 없을 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          description: 'valid description',
        })
        .expect(400);
    });

    it('등록 요청한 제품 가격이 숫자가 아닐 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          price: '10000',
          description: 'valid description',
        })
        .expect(400);
    });

    it('등록 요청한 제품 가격이 정수가 아닐 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          price: 10000.5,
          description: 'valid description',
        })
        .expect(400);
    });

    it('등록 요청한 제품 가격이 음수일 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          price: -10000,
          description: 'valid description',
        })
        .expect(400);
    });

    it('등록 요청한 제품 가격이 0일 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          price: 0,
          description: 'valid description',
        })
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    it('모든 제품 목록 반환', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200);
    });
  });

  describe('/products/:id (GET)', () => {
    beforeEach(() => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          price: 10000,
          description: 'valid description',
        });
    });

    it('존재하는 제품을 반환한다.', () => {
      return request(app.getHttpServer())
        .get('/products/1')
        .expect(200);
    });

    it('존재하지 않는 제품을 요청할 경우 HTTP Status 404 응답한다.', () => {
      return request(app.getHttpServer())
        .get('/products/10000')
        .expect(404);
    });
  });

  describe('/products/:id (PATCH)', () => {
    beforeEach(() => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          price: 10000,
          description: 'valid description',
        });
    });

    it('존재하는 제품을 업데이트 할 수 있다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          name: 'valid name2',
          price: 10002,
          description: 'valid description2',
        })
        .expect(200, {
          id: 1,
          name: 'valid name2',
          price: 10002,
          description: 'valid description2',
        });
    });

    it('요청하는 id의 제품이 없을 시 HTTP Status 404 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/10000')
        .send({})
        .expect(404);
    });

    it('업데이트 요청하는 제품 이름이 이미 존재하는 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          name: 'valid name',
        })
        .expect(409);
    });

    it('업데이트 요청한 제품 이름이 문자열이 아닐 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          name: 10000,
        })
        .expect(400);
    });

    it('업데이트 요청한 제품 이름 길이가 2 미만이면 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          name: 'a',
        })
        .expect(400);
    });

    it('업데이트 요청한 제품 이름 길이가 20 초과면 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          name: 'a'.repeat(21),
        })
        .expect(400);
    });

    it('이미 업데이트 한 제품에 대해 또 업데이트 요청할 경우 HTTP Status 400 응답한다. (2번 이상 업데이트 불가능)', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({ price: 100 })
        .then(() => {
          return request(app.getHttpServer())
            .patch('/products/1')
            .send({ price: 10 })
            .expect(405);
        });
    });

    it('업데이트 요청한 제품 가격이 숫자가 아닐 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          price: '10000',
        })
        .expect(400);
    });

    it('업데이트 요청한 제품 가격이 정수가 아닐 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          price: 10000.5,
        })
        .expect(400);
    });

    it('업데이트 요청한 제품 가격이 음수일 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          price: -10000,
        })
        .expect(400);
    });

    it('업데이트 요청한 제품 가격이 0일 경우 HTTP Status 400 응답한다.', () => {
      return request(app.getHttpServer())
        .patch('/products/1')
        .send({
          price: 0,
        })
        .expect(400);
    });
  });

  describe('/products/:id (DELETE)', () => {
    beforeEach(() => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'valid name',
          price: 10000,
          description: 'valid description',
        });
    });

    it('존재하는 제품을 삭제 할 수 있다.', () => {
      return request(app.getHttpServer())
        .delete('/products/1')
        .expect(200)
        .then(() => {
          return request(app.getHttpServer())
            .get('/products/1')
            .expect(404);
        });
    });

    it('삭제 요청하는 id의 제품이 없을 시 HTTP Status 404 응답한다.', () => {
      return request(app.getHttpServer())
        .delete('/products/10000')
        .expect(404);
    });
  });
});
