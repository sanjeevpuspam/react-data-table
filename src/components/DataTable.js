import { useState, useEffect} from "react";
import axios from "axios";
import './Table.css';


const DataTable = () =>{

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [pages,setPages] = useState(0);
    const [sortType, setSortType] = useState(null);
    const [header,setHeader] = useState([]);

    useEffect( ()=> {
        fetchData(currentPage, perPage);
    },[]);

    useEffect(()=>{
        sortArray(sortType);
    },[sortType]);

    const setTableHeader = (arry) =>{
        let removeKey = ['__v','airline'];
        let thead = Object.assign([],Object.keys(arry));
        thead = thead.filter(item => !removeKey.includes(item));
        setHeader(thead);
        // set sorting after page load
        let type = (!!localStorage.getItem('sort_type') && localStorage.getItem('sort_type') !== "undefined") ? localStorage.getItem('sort_type') : '_id';
        sortArray(type);
    };

    const fetchData = async (page, size) => {
        const url = `https://api.instantwebtools.net/v1/passenger?page=${page}&size=${size}`;
         await axios.get(url).then(res=> {
            const jsonData = res.data;
            console.log("data",jsonData.data);
            setCurrentPage(page);
            setData(jsonData.data);
            setPages(jsonData.totalPages);
            setTableHeader(jsonData.data[0]);
        }).catch (error => {
            console.log("Something went wrong in api call",error);
        });
    };

    const sortArray = type => {
        const types = header.length>0 && header.reduce((a, v) => ({ ...a, [v]: v}), {});
        const sortProperty = types[type];
        const sorted = [...data].sort((a, b) => b[sortProperty] > a[sortProperty] ? -1 : 1);
        setSortType(type);
        localStorage.setItem('sort_type',type);
        setData(sorted);
    };

    const displayPageNumber = () => {
        const pageNumbers = [];
        for (let i = 1; i <= pages; i++) {
          pageNumbers.push(i);
        };
       const renderPageNumbers = pageNumbers.map(number => {
        let liClassName = (currentPage===number) ? "active" : '';
            return (<a key={number} className={ liClassName } onClick={() => fetchData(number, perPage) } > {number} </a>);
        }); 

        return(<div className="center">
		<div className="pagination">
                <a  onClick={()=> fetchData(currentPage -1, perPage )}>&laquo;</a>
                    { renderPageNumbers }
                <a  onClick={()=> fetchData(currentPage +1, perPage)}>&raquo;</a>
		    </div>
	    </div>);
    };

    return(<>
            <p><><label htmlFor="select"> Sort by : </label><select className="custom-select" id="select" onChange={(e) => sortArray(e.target.value)}>
                { header.map((key, index) => {
                    return <option value={key} key={index}> { key.replace('_','').toUpperCase() } </option>
                })}
            </select></></p>
            <table>
                <thead>
                    { <tr> 
                        { header.map((key, index) => {
                            return <th key={index} onClick={()=> sortArray(key) }> {key.replace('_','').toUpperCase()} </th>
                        })}
                    <th>AIRLINE LOGO</th></tr>}
                </thead>
                <tbody>
                    { data.length >0 && [...data].map((item,key)=> {
                        console.log("item==>",item);
                        const {_id, name, trips, airline } = item;
                        return(
                        <tr key={ key }>
                            <td>{ _id }</td>
                            <td>{ name }</td>
                            <td>{ trips }</td>
                            <td><img src={ airline[0].logo } alt={ airline[0].name } title={ airline[0].name }/></td>
                        </tr>)
                    }) } 
                </tbody>
            </table>
                {  displayPageNumber() }
        </>);
}

export default DataTable;