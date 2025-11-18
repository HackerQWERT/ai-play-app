import { callAgentAction } from "./actions";

export default function ServerCom() {
  const isServer = typeof window === "undefined";
  console.log(isServer ? "SSR: 服务器端渲染" : "CSR: 客户端渲染");
  console.log("ServerCom 重新渲染");
  return <form action={callAgentAction}>Server Component</form>;
}
