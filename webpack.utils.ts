import path from 'path';
import { readFileSync } from 'fs';

const DEFAULT_TSCONFIG_PATH = path.resolve(__dirname, './tsconfig.json');

type TSConfig = {
    compilerOptions: {
        baseUrl: string;
        paths: Record<string, string[]>;
        [props: string]: any;
    };
    [props: string]: any;
};

/**
 * Inspired by
 * https://gist.github.com/nerdyman/2f97b24ab826623bff9202750013f99e
 * https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/32#issuecomment-464538166
 *
 * Or use `tsconfig-paths-webpack-plugin` but which has compatibility issue now
 * https://github.com/dividab/tsconfig-paths-wejbpack-plugin/issues/61
 * https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/60
 */
export const tsPathsToWebpackAlias = ({
    tsconfigPath = DEFAULT_TSCONFIG_PATH,
    webpackConfigBasePath = __dirname,
    debug = false,
} = {}) => {
    const log = (...args: any[]) => {
        if (debug) {
            console.log('[tsPathsToWebpackAlias]', ...args);
        }
    };

    const tsconfig = loadTSConfig(tsconfigPath);
    const paths = tsconfig.compilerOptions.paths;
    const baseUrl = tsconfig.compilerOptions.baseUrl;
    const aliases = Object.entries(paths).reduce<Record<string, string>>((result, [pathKey, pathValue]) => {
        const aliasKey = pathKey.replace('/*', '');
        const aliasValue = path.resolve(
            webpackConfigBasePath,
            baseUrl,
            pathValue[0].replace('/*', '').replace('*', ''),
        );
        result[aliasKey] = aliasValue;
        return result;
    }, {});

    log('aliases: ', aliases);

    return aliases;
};

export const loadTSConfig = (path = DEFAULT_TSCONFIG_PATH) => {
    return loadJson<TSConfig>(path);
};

/**
 * Inspired by
 * https://www.techiediaries.com/json-comments/
 */
const loadJson = <T = any>(path: string) => {
    // Did not `import` directly because that will throw error if the `tsconfig.json` contains any comment
    // which is supported by IDE by not allowed by Node.js
    const json = readFileSync(path, 'utf-8');
    const stripedComments = stripJsonComments(json);
    const parsed = JSON.parse(stripedComments) as T;

    return parsed;
};

/**
 * Or just use
 * https://github.com/sindresorhus/strip-json-comments
 */
const stripJsonComments = (data: string) => {
    var re = new RegExp('//(.*)', 'g');
    return data.replace(re, '');
};
