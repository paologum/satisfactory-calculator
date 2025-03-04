import { readFile , writeFile } from "fs/promises";
import { join } from "path";
import { getJSONDirectory } from "@/parsing/util";
import { createProductsMap } from "@/parsing/create-products-map";

export async function GET(req: Request) {
  const products = await createProductsMap();
  await writeFile(join(getJSONDirectory(), "products-map.json"), JSON.stringify(products, null, 2));
  return Response.json(products);
}
