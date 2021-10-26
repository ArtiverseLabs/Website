// https://github.com/travist/jsencrypt

var Pubkey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvSxWSHXA+dbZa6Uspmy7
wiFDQeIl3O7Z38eTlEL6oWksCD2TYzyy65TBAi50X2+Oh+vQH5pe/7A3hHAOWtLJ
L5mqo7qHUQZ5TpXD7aXIXXK22CaO4Z3sOIbsverobykUL+PXLNwqUAu0LOO/fcuB
UMNL/CQp3peg2kyAQTd6gT4xtA7L+KMVmAmPqIwgJ7CHdyU4mND7lVwQWfT8hiXR
kFvdpMzqiydvT3Zs7/BJplvOb2oWjV8UHjxP3zt7yB2gmt6kAJL3EOgMdWx2a6dU
N6JgXnSPSr8G7XJ8CwUUncDO9Dn6rMgo3girkhTBNZHcWo5lOUn9quIetfGiqbIt
3oK2gBzeH0qSIvR5zLVps8Z83a8nCHIIcO/L8UNFR+yh9nJ9piwVIW2SSmlogAU+
QNazJh0yYuiT9raPcEbnE4/IgniwBvD8ZsldMNRHlFYTCFsNv39IoSZwulkC6ehO
7Ai6lAWPkFPE8dZPU7b1/BIQ8SD5cXtFDgzOCSZoMkpvCTb0bodtSQWmVZIu3hXz
I7AoQuT425QHYRUsZmAqf6nVgngxuns3kUA7URnMGEefAJH0vxrHBvk9/N86Pfd2
k5bO+4hUCAYFeRqQAjx6YgN85VPfzLHbyJHTujNMJUFR3Mrz58yUiQvAPRrjIxxi
4w4/Bv2NploAPZw2EHvcgcMCAwEAAQ==
-----END PUBLIC KEY-----`;

window.encrypt = (text) => {
	var encrypt = new JSEncrypt();
	encrypt.setPublicKey(Pubkey);
	return encrypt.encrypt(text);
};