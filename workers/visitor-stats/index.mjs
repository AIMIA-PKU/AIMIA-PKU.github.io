export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);
    const headers = { Vary: 'Origin' };
    if (origin === env.SITE_ORIGIN) headers['Access-Control-Allow-Origin'] = origin;

    if (url.pathname === '/visit' && request.method === 'POST') {
      if (origin !== env.SITE_ORIGIN) return new Response(null, { status: 403, headers });
      const code = request.cf?.country;
      const country =
        typeof code === 'string' && /^[A-Z]{2}$/.test(code) && !['XX', 'T1'].includes(code)
          ? code
          : '';
      const city =
        country && typeof request.cf?.city === 'string' ? request.cf.city.trim().slice(0, 120) : '';
      await env.DB.prepare(
        `INSERT INTO visitor_regions (country, city, visits) VALUES (?, ?, 1)
         ON CONFLICT (country, city) DO UPDATE SET visits = visits + 1`,
      )
        .bind(country, city)
        .run();
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === '/summary' && request.method === 'GET') {
      const [countries, cities] = await env.DB.batch([
        env.DB.prepare(
          'SELECT country, SUM(visits) AS visits FROM visitor_regions GROUP BY country',
        ),
        env.DB.prepare(
          "SELECT country, city, visits FROM visitor_regions WHERE country <> '' ORDER BY visits DESC, country, city LIMIT 8",
        ),
      ]);
      return Response.json(
        { countries: countries.results, cities: cities.results },
        { headers: { ...headers, 'Cache-Control': 'public, max-age=60' } },
      );
    }

    return new Response(null, { status: 404, headers });
  },
};
