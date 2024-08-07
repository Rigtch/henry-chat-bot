import { Test, type TestingModule } from '@nestjs/testing'
import { mock } from 'vitest-mock-extended'
import type { Document } from '@langchain/core/documents'

import { DocumentsVectorStore } from './documents.vector-store'

vi.stubEnv('OPENAI_API_KEY', 'test')

vi.mock('@langchain/community/vectorstores/typeorm', () => {
  const TypeORMVectorStore = vi.fn().mockReturnValue({
    asRetriever: vi.fn().mockReturnValue({}),
    addDocuments: vi.fn(),
    embeddings: {},
    ensureTableInDatabase: vi.fn(),
  })

  return {
    TypeORMVectorStore: Object.assign(TypeORMVectorStore, {
      fromDataSource: vi.fn().mockResolvedValue(TypeORMVectorStore()),
    }),
  }
})

describe('DocumentsVectorStore', () => {
  let moduleRef: TestingModule
  let documentsVectorStore: DocumentsVectorStore

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [DocumentsVectorStore],
    }).compile()

    documentsVectorStore = moduleRef.get(DocumentsVectorStore)
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  test('should be defined', () => {
    expect(documentsVectorStore).toBeDefined()
  })

  describe('onModuleInit', () => {
    test('should initialize the vector store', async () => {
      await documentsVectorStore.onModuleInit()

      expect(documentsVectorStore.retriever).toBeDefined()
      expect(documentsVectorStore.embeddings).toBeDefined()
    })
  })

  describe('addDocuments', () => {
    test('should add documents to the vector store', async () => {
      const documents = [
        mock<Document>({
          pageContent: 'test',
        }),
      ]

      await documentsVectorStore.onModuleInit()
      await documentsVectorStore.addDocuments(documents)

      expect(
        // @ts-expect-error Mocking private method
        // eslint-disable-next-line @typescript-eslint/unbound-method
        documentsVectorStore.vectorStore.addDocuments
      ).toHaveBeenCalledWith(documents)
    })
  })
})
