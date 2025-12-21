import type { HealthCheck } from "./types"

const TABLE = process.env.AWS_DYNAMODB_TABLE
const REGION = process.env.AWS_REGION || "us-east-1"
const SNS_TOPIC_ARN = process.env.AWS_SNS_TOPIC_ARN

async function getAwsClients() {
  try {
    const ddbMod = await import("@aws-sdk/client-dynamodb")
    const utilMod = await import("@aws-sdk/util-dynamodb")
    const snsMod = await import("@aws-sdk/client-sns")

    const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } = ddbMod as any
    const { unmarshall, marshall } = utilMod as any
    const { SNSClient, PublishCommand } = snsMod as any

    const ddb = new DynamoDBClient({ region: REGION })
    const sns = new SNSClient({ region: REGION })

    return { ddb, GetItemCommand, PutItemCommand, UpdateItemCommand, unmarshall, marshall, sns, PublishCommand }
  } catch (e) {
    console.warn("AWS SDK not installed or failed to load:", e)
    throw e
  }
}

export async function getHistoryAws(id: string): Promise<HealthCheck[]> {
  if (!TABLE) return []
  try {
    const { ddb, GetItemCommand, unmarshall, marshall } = await getAwsClients()
    const cmd = new GetItemCommand({ TableName: TABLE, Key: marshall({ id }) })
    const res = await ddb.send(cmd)
    if (!res.Item) return []
    const item = unmarshall(res.Item)
    return (item.history ?? []) as HealthCheck[]
  } catch (e) {
    console.warn("getHistoryAws disabled:", e)
    return []
  }
}

export async function setHistoryAws(id: string, history: HealthCheck[]) {
  if (!TABLE) return
  try {
    const { ddb, PutItemCommand, marshall } = await getAwsClients()
    const cmd = new PutItemCommand({ TableName: TABLE, Item: marshall({ id, history }) })
    await ddb.send(cmd)
    await publishEvent(id, { history })
  } catch (e) {
    console.warn("setHistoryAws failed:", e)
  }
}

export async function appendCheckAws(id: string, check: HealthCheck): Promise<HealthCheck[]> {
  if (!TABLE) return []
  try {
    const { ddb, UpdateItemCommand, unmarshall, marshall } = await getAwsClients()
    const cmd = new UpdateItemCommand({
      TableName: TABLE,
      Key: marshall({ id }),
      UpdateExpression: "SET history = list_append(if_not_exists(history, :empty), :c)",
      ExpressionAttributeValues: marshall({ ":empty": [], ":c": [check] }),
      ReturnValues: "UPDATED_NEW",
    })
    const res = await ddb.send(cmd)
    const updated = res.Attributes ? (unmarshall(res.Attributes).history ?? []) as HealthCheck[] : []
    await publishEvent(id, { check })
    return updated
  } catch (e) {
    console.warn("appendCheckAws failed:", e)
    return []
  }
}

async function publishEvent(id: string, payload: any) {
  if (!SNS_TOPIC_ARN) return
  try {
    const { sns, PublishCommand } = await getAwsClients()
    await sns.send(new PublishCommand({ TopicArn: SNS_TOPIC_ARN, Message: JSON.stringify({ id, payload }) }))
  } catch (e) {
    console.warn("SNS publish error", e)
  }
}

export default null
