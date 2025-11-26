// простые хелперы для заголовков и дат
export const getOzonHeaders = (clientId: string, apiKey: string) => ({
	'Client-Id': clientId,
	'Api-Key': apiKey,
	'Content-Type': 'application/json',
	Accept: 'application/json',
});
