// API 客户端测试脚本
import { client } from './api/client.js';
import { buildFieldsParam, DEFAULT_PAPER_FIELDS, DEFAULT_AUTHOR_FIELDS } from './utils/fields.js';

async function testSearchPapers() {
  console.log('=== 测试论文搜索 ===');
  try {
    const result = await client.searchPapers({
      query: 'transformer attention',
      fields: buildFieldsParam(DEFAULT_PAPER_FIELDS),
      limit: 3,
    });
    console.log(`找到 ${result.total} 篇论文，返回 ${result.data.length} 篇：`);
    result.data.forEach((paper, i) => {
      console.log(`${i + 1}. ${paper.title} (${paper.year}) - 引用: ${paper.citationCount}`);
    });
    return result.data[0]?.paperId;
  } catch (error) {
    console.error('搜索失败:', error);
    return null;
  }
}

async function testGetPaper(paperId: string) {
  console.log('\n=== 测试获取论文详情 ===');
  try {
    const paper = await client.getPaper(paperId, buildFieldsParam(DEFAULT_PAPER_FIELDS));
    console.log('标题:', paper.title);
    console.log('年份:', paper.year);
    console.log('摘要:', paper.abstract?.substring(0, 200) + '...');
    console.log('作者:', paper.authors?.map(a => a.name).join(', '));
    return paper.authors?.[0]?.authorId;
  } catch (error) {
    console.error('获取失败:', error);
    return null;
  }
}

async function testSearchAuthors() {
  console.log('\n=== 测试作者搜索 ===');
  try {
    const result = await client.searchAuthors({
      query: 'Yoshua Bengio',
      fields: buildFieldsParam(DEFAULT_AUTHOR_FIELDS, DEFAULT_AUTHOR_FIELDS),
      limit: 3,
    });
    console.log(`找到 ${result.total} 位作者：`);
    result.data.forEach((author, i) => {
      console.log(`${i + 1}. ${author.name} - h-index: ${author.hIndex}, 论文数: ${author.paperCount}`);
    });
  } catch (error) {
    console.error('搜索失败:', error);
  }
}

async function main() {
  console.log('Semantic Scholar API 客户端测试\n');

  // 测试论文搜索
  const paperId = await testSearchPapers();

  // 测试获取论文详情
  if (paperId) {
    await testGetPaper(paperId);
  }

  // 测试作者搜索
  await testSearchAuthors();

  console.log('\n=== 测试完成 ===');
}

main().catch(console.error);
