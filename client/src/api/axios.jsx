import axios from "axios";

const api = axios.create({
	baseURL: "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/",
});

export default api;