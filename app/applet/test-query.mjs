async function run() {
  const WP_GRAPHQL_URL = "https://impacto33.creativushosting.com/graphql";
  const query = `
    query {
      productCategories(first: 20) {
        nodes {
          name
          slug
        }
      }
    }
  `;
  const res = await fetch(WP_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
run();
