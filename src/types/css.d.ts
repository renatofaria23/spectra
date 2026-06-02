declare module '@mantine/core/styles.css' {
  const styles: Record<string, string>;
  export default styles;
}

declare module '*.css' {
  const content: { [key: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: { [key: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [key: string]: string };
  export default content;
}

declare module '*.less' {
  const content: { [key: string]: string };
  export default content;
}
