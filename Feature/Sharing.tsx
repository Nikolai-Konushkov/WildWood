import Share from 'react-native-share';

let options = {
  subject: '',
  title: '',
  url: '',
  message: '',
};

const shareContent = params => {
  const share = async (customOptions = options) => {
    try {
      await Share.open(customOptions);
    } catch (err) {
      console.log(err);
    }
  };

  share({
    subject: 'Смотри, какой ивент!',
    title: 'Смотри, какой ивент!',
    message: params.description + '\n',
    url: params.link,
  });
};

export default shareContent;
