export const getCurrentUser = () => {
  return localStorage.getItem('nihongo_lens_user') || 'Guest';
};

export const setCurrentUser = (username) => {
  localStorage.setItem('nihongo_lens_user', username);
};

export const getPracticeSets = (username) => {
  const data = localStorage.getItem(`practices_${username}`);
  return data ? JSON.parse(data) : [];
};

export const savePracticeSet = (username, set) => {
  const existing = getPracticeSets(username);
  existing.unshift(set); // 放在最新
  localStorage.setItem(`practices_${username}`, JSON.stringify(existing));
};

export const getPracticeSetById = (username, id) => {
  const sets = getPracticeSets(username);
  return sets.find(s => s.id === id);
};
