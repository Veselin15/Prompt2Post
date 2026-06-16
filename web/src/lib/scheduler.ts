export interface PublishRunResult {
  checked: number;
  published: number;
  failed: number;
}

export async function publishDueScheduledPosts(_userId?: string): Promise<PublishRunResult> {
  return { checked: 0, published: 0, failed: 0 };
}
