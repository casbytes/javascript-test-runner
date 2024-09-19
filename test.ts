import { Client } from "@upstash/qstash";

const client = new Client({
  token:
    "eyJVc2VySUQiOiI2ZmYyZTk1NS03N2YxLTQ2YjQtYjNiMi05MjQ3YWM1YmVhNDQiLCJQYXNzd29yZCI6IjViMjBkYmU5NzdjNzQ5NDY4NTYwM2UyZjA4NDliZGM1In0=",
});

const queue = client.queue({ queueName: "casbytes" });
await queue.upsert({ parallelism: 1 });

async function publish(body: object) {
  return queue.enqueueJSON({
    url: "https://casbytes.requestcatcher.com/test",
    body,
    headers: { "my-header": "my-value" },
    callback: "https://casbytes.com/qstash/callback",
  });
}

const res = await publish({ name: "CASBytes" });

console.log(res);

// export class QStash {
//   static publish = publish;
// }
