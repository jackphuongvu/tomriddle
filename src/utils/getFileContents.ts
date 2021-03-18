/** prompts for file and returns contents */
const getFileContents = (): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const { files } = target;
      const file = files ? files[0] : null;

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (readerEvent) => {
        const content = readerEvent?.target?.result;

        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject();
        }
      };

      reader.onerror = reject;
    };

    fileInput.click();
  });

export default getFileContents;
