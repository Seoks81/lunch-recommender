export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'missing_api_key' });
  }

  const {
    endpoint = 'category',
    x,
    y,
    radius = '20000',
    page = '1',
    size = '15',
    sort = 'distance',
    query,
    category_group_code = 'FD6'
  } = req.query || {};

  if (!['category', 'keyword'].includes(endpoint)) {
    return res.status(400).json({ error: 'invalid_endpoint' });
  }

  if (!x || !y) {
    return res.status(400).json({ error: 'missing_coordinates' });
  }

  if (endpoint === 'keyword' && !query) {
    return res.status(400).json({ error: 'missing_query' });
  }

  const params = new URLSearchParams({
    x: String(x),
    y: String(y),
    radius: String(radius),
    page: String(page),
    size: String(size),
    sort: String(sort),
  });

  let path;

  if (endpoint === 'keyword') {
    path = 'keyword.json';
    params.set('query', String(query));
  } else {
    path = 'category.json';
    params.set('category_group_code', String(category_group_code));
  }

  const url =
    `https://dapi.kakao.com/v2/local/search/${path}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    const body = await response.text();

    res.status(response.status);
    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );

    return res.send(body);
  } catch (error) {
    return res.status(502).json({
      error: 'upstream_request_failed',
      message: error?.message || 'Kakao request failed',
    });
  }
}
