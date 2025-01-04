async function get(req, res, authorization) {
  const { query } = req;
  const { page = 0, author, search } = query;
  const { owner } = authorization;

  let dbQuery = database
    .from("questions")
    .select()
    .or(
      `status.eq.3, and(status.eq.0, author.eq.${owner}), and(status.eq.1, author.eq.${owner}), and(status.eq.2, author.eq.${owner})`
    );

  if (search) {
    dbQuery = dbQuery.textSearch("search_columns", search, {
      config: "english",
      type: "websearch",
    });
  }

  if (author) {
    dbQuery = dbQuery.eq("author", author);
  }

  const { data: questions, error } = await dbQuery
    .order("sentAt")
    .range(500 * page, 499 + 500 * page);

  return { questions, count: questions?.length || 0, error };
}

module.exports = { get };