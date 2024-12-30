// GET: Obter todas as perguntas ordenadas por envio (500 por request) — recebe todas as suas + já enviadas por outros usuários
// page: página (0-infinito)
// author: autor de questão (discord snowflake)
// search: pesquisar por texto
async function get(req, res, authorization) {
  const queries = req.query;
  const page = queries.page || 0;
  const author = queries.author;
  const search = queries.search;

  const owner = authorization.owner;

  let dbQuery = database.from('questions').select().or(`status.eq.3,and(status.eq.0,author.eq.${owner}),and(status.eq.1,author.eq.${owner}),and(status.eq.2,author.eq.${owner})`);

  if (search) dbQuery = dbQuery.textSearch('search_columns', search, {config: 'english', type: 'websearch'});
  if (author) dbQuery = dbQuery.eq('author', author);

  const { data: questions, error } = await dbQuery
    .order('sentAt')
    .range(0 + 500 * page, 499 + 500 * page);
    
  return { questions, count: questions?.length, error: error ? error : undefined };
}

module.exports = { get };