import { fetchAllTransactionalPages } from "./src/lib/wpGraphql";

async function run() {
  const pages = await fetchAllTransactionalPages();
  console.log(pages.map(p => p.uri));
}

run();