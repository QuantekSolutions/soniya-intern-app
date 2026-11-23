import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TipJarV2Module = buildModule("TipJarV2Module", (m) => {
  // Deploy the updated TipJar contract
  const tipJar = m.contract("TipJar");

  return { tipJar };
});

export default TipJarV2Module;