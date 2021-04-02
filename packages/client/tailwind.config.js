const hexRgb = require('hex-rgb');
const plugin = require('tailwindcss/plugin')

const makeShadow = (name, rgb) => {
  const obj = {};
  obj[`${name}-xs`] = `0 0 0 1px rgba(${rgb}, 0.05)`;
  obj[`${name}-xs`] = `0 0 0 1px rgba(${rgb}, 0.05)`;
  obj[`${name}-sm`] = `0 1px 2px 0 rgba(${rgb}, 0.05)`;
  obj[name] = `0 1px 3px 0 rgba(${rgb}, 0.1), 0 1px 2px 0 rgba(${rgb}, 0.06)`;
  obj[`${name}-md`] = `0 4px 6px -1px rgba(${rgb}, 0.1), 0 2px 4px -1px rgba(${rgb}, 0.06)`;
  obj[`${name}-lg`] = `0 10px 15px -3px rgba(${rgb}, 0.1), 0 4px 6px -2px rgba(${rgb}, 0.05)`;
  obj[`${name}-xl`] = `0 20px 25px -5px rgba(${rgb}, 0.1), 0 10px 10px -5px rgba(${rgb}, 0.04)`;
  obj[`${name}-2xl`] = `0 25px 50px -12px rgba(${rgb}, 0.25)`;
  obj[`${name}-inner`] = `inset 0 2px 4px 0 rgba(${rgb}, 0.06)`;
  return obj;
};

const plugins = [
  plugin(({ addBase, theme }) => {
    // Handle color objects as well
    const fresh = Object.values(
      Object.entries(theme("colors")).reduce((acc, curr) => {
        const [k, v] = curr;
        if (
          typeof v === "string" &&
          v !== "transparent" &&
          v !== "currentColor"
        ) {
          const { red, green, blue } = hexRgb(v);
          acc[k] = makeShadow(k, `${red}, ${green}, ${blue}`);
        }
        if (typeof v === "object") {
          Object.entries(v).forEach(([_k, _v]) => {
            const { red, green, blue } = hexRgb(_v);
            acc[`${k}-${_k}`] = makeShadow(
              `${k}-${_k}`,
              `${red}, ${green}, ${blue}`
            );
          });
        }
        return acc;
      }, {})
    ).reduce((acc, cur) => ({ ...acc, ...cur }), {});

    const boxShadow = {
      xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      default:
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      md:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      outline: "0 0 0 3px rgba(66, 153, 225, 0.5)",
      none: "none",
      ...fresh,
    };

    addBase({ boxShadow });
  })
];

module.exports = {
  plugins
};
