const isObject = (obj: any) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

const flattenObject = <T>(obj: T, prefixKey?: string) => {
    if (!isObject(obj) && prefixKey) {
        return {
            [prefixKey]: obj,
        };
    }
    return Object.entries(obj).reduce<{ [key: string]: any }>((acc, [key, value]): any => {
        const prefixedKey = prefixKey ? `${prefixKey}_${key}` : key;
        const flattened = flattenObject(value, prefixedKey);
        return {
            ...acc,
            ...flattened,
        };
    }, {});
};

const obj = {
    a: {
        b: {
            c: 42,
        },
    },
    d: {
        e: {
            f: [],
        },
        g: null,
    },
};

const data = {
    individual: {
        level_1: {
            daily_fiat_limit: 0,
            daily_crypto_limit: 10000,
            monthly_fiat_limit: 0,
            monthly_crypto_limit: 100000,
        },
        level_2: {
            daily_fiat_limit: 30000,
            daily_crypto_limit: 30000,
            monthly_fiat_limit: 300000,
            monthly_crypto_limit: 300000,
        },
        level_3: {
            daily_fiat_limit: 500000,
            daily_crypto_limit: 500000,
            monthly_fiat_limit: 5000000,
            monthly_crypto_limit: 5000000,
        },
    },
    corporation: {
        level_1: {
            daily_fiat_limit: 0,
            daily_crypto_limit: 10000,
            monthly_fiat_limit: 0,
            monthly_crypto_limit: 100000,
        },
        level_2: {
            daily_fiat_limit: 100000,
            daily_crypto_limit: 100000,
            monthly_fiat_limit: 1000000,
            monthly_crypto_limit: 1000000,
        },
        level_3: {
            daily_fiat_limit: 500000,
            daily_crypto_limit: 500000,
            monthly_fiat_limit: 5000000,
            monthly_crypto_limit: 5000000,
        },
    },
};

const flatten = flattenObject(data);
console.log('flatten', flatten);
