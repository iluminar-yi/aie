export const arrayIn = <T extends {}>(value: T, array: T[]): boolean => {
    return !!~array.indexOf(value);
};
