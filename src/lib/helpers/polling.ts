export async function pollUntil<T>(
  fetchAction: () => T,
  continueCondition: (result: T) => boolean,
  pollingPeriod: number = 100,
  timeLimit: number = 5000
): Promise<T | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeLimit) {
    const result = fetchAction();
    
    if (continueCondition(result)) {
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollingPeriod));
  }
  
  return null; // Timeout reached
}