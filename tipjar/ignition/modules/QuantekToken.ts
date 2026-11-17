
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const QuantekTokenModule = buildModule("QuantekTokenModule", (m) => {
  const quantekToken = m.contract("QuantekToken");

  return { quantekToken };
});

export default QuantekTokenModule;
