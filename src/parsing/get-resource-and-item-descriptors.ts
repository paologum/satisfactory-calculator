import { ItemDescriptorsRaw, assertItemDescriptorsRaw, convertStringFieldsOJsonToNumber } from "@/types";
import { access, readFile, writeFile } from "fs/promises";
import { getJSONDirectory } from "./util";
import { join } from "path";

export async function getItemAndResourceDescriptors() {
  const mainJsonFilepath = await join(getJSONDirectory(), "Docs-utf8.json");
  try {
    await access(mainJsonFilepath);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      console.error("Docs-utf8.json not found");
      throw e;
    }
    throw e;
  }
  const rawProducts: { [key: string]: ItemDescriptorsRaw } = {};
  const rawResources: { [key: string]: ItemDescriptorsRaw } = {};
  const json = await readFile(mainJsonFilepath, "utf-8");
  for (const obj of JSON.parse(json)) {
    if (obj.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'") {
      for (const descriptor of obj.Classes) {
        convertStringFieldsOJsonToNumber(descriptor);
        assertItemDescriptorsRaw(descriptor);
        rawProducts[descriptor.ClassName] = descriptor;
      }
    } else if (obj.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGResourceDescriptor'") {
      for (const descriptor of obj.Classes) {
        convertStringFieldsOJsonToNumber(descriptor);
        assertItemDescriptorsRaw(descriptor);
        rawResources[descriptor.ClassName] = descriptor;
      }
    }
  }
  await writeFile(join(getJSONDirectory(), "raw-item-descriptors.json"), JSON.stringify(rawProducts, null, 2));
  await writeFile(join(getJSONDirectory(), "raw-resource-descriptors.json"), JSON.stringify(rawResources, null, 2));
  return {
    rawProducts,
    rawResources
  };
}
