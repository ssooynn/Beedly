import { Box } from "grommet";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { CategoryBar } from "../components/MainCategoryBar";
import styled from "styled-components";
import { HorizonScrollRowTable } from "../components/HorizonScrollTable";
import { SortButtonArea } from "../components/SortButtonArea";
import { HalfProductCard } from "../components/HalfProductCard";
import { Bold } from "grommet-icons";
import SortIcon from "../assets/img/SortIcon.svg";
import {
  getOnairByCategoryApi,
  getProductByCategoryApi,
} from "../utils/apis/PersonalProductAPI";
import PaintingBanner from "../assets/img/PaintingBanner.png";
import PrintBanner from "../assets/img/PrintBanner.png";
import EditionBanner from "../assets/img/EditionBanner.png";
import PhotoBanner from "../assets/img/PhotoBanner.png";
import FigureBanner from "../assets/img/FigureBanner.png";
import { StyledText } from "../components/Common";

const SortButton = styled.button`
  border: 0;
  background-color: white;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-weight: 700;
`;

const SortImg = styled.img`
  width: 14px;
  padding-left: 3px;
  padding-top: 4px;
`;

const StyledTableTitle = styled.div`
  font-size: 16px;
  color: #1f1d1d;
  padding-left: 20px;
  font-weight: 900;
`;

const StyledTableSubtitle = styled.div`
  font-size: 14px;
  padding-left: 20px;
  font-weight: 500;
  color: rgba(31, 29, 29, 0.4);
`;

const StyledCategoryTable = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0;
`;

const StyledCategoryButton = styled.button`
  display: inline;
  padding: 0 10px;
  justify-content: center;
  font-size: 16px;
  border: 0;
  background-color: white;
`;
const ProductTable = styled.div`
  justify-content: center;
  display: flex;
`;

const SubBanner = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

export default function ProductListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hotProductList, setHotProductList] = useState([]);
  const [newProductList, setNewProductList] = useState([]);
  const [popularProductList, setPopularProductList] = useState([]);
  const [loading, setloading] = useState(true);
  const [sortMethod, setSortMethod] = useState(["?????????"]);
  const [bannerImg, setBannerImg] = useState(PaintingBanner);

  const [size, setSize] = useState({});
  const gottenCategory = location.state
    ? location.state.gottenCategory
    : "??????";
  const [nowCategory, setNowCategory] = useState(gottenCategory);
  const GoProductDetail = (id) => {
    navigate(`/productDetail/${id}`);
  };

  const HandleSortButton = () => {
    setloading(true);
    sortMethod === "?????????"
      ? setSortMethod((prev) => (prev = "?????????"))
      : setSortMethod((prev) => (prev = "?????????"));
  };

  useEffect(() => {
    if (loading) {
      //??????????????? ?????? ?????? ????????????
      if (nowCategory === "??????") {
        setBannerImg(PaintingBanner);
      } else if (nowCategory === "??????") {
        setBannerImg(PrintBanner);
      } else if (nowCategory === "?????????") {
        setBannerImg(EditionBanner);
      } else if (nowCategory === "??????") {
        setBannerImg(PhotoBanner);
      } else if (nowCategory === "??????") {
        setBannerImg(FigureBanner);
      }

      getProductByCategoryApi(
        nowCategory,
        "0",
        "20",
        "favoriteCount,DESC",
        (res) => {
          console.log(res);
          setHotProductList(res.data.content);
        },
        (err) => {
          console.log(err);
        }
      );

      //??????????????? ?????? ?????? ?????? ????????????(?????????)
      getProductByCategoryApi(
        nowCategory,
        "0",
        "20",
        "createdDate,DESC",
        (res) => {
          console.log(res);
          setNewProductList(res.data.content);
        },
        (err) => {
          console.log(err);
        }
      );

      //??????????????? ?????? ?????? ?????? ????????????(?????????/?????????)
      getProductByCategoryApi(
        nowCategory,
        "0",
        "20",
        sortMethod === "?????????" ? "favoriteCount,DESC" : "createdDate,DESC",
        (res) => {
          console.log(res);
          setPopularProductList(res.data.content);
        },
        (err) => {
          console.log(err);
        }
      );

      setloading(false);
    }
    return () => setloading(false);
    // eslint-disable-next-line
  }, [nowCategory, sortMethod]);

  // useEffect(() => {
  //   setNowCategory(gottenCategory);
  //   // ???????????? ??????
  //   getOnairByCategoryApi(NowCategory, "0", "20", "", (res) => {
  //     console.log(res);
  //     setOnairList(res.data.content);
  //   }, (err) => {
  //     console.log(err);
  //   })

  //   //?????? ?????? ?????? ????????????
  //   getPersonalProductListApi("0", "20", "createdDate,DESC", (res) => {
  //     setNewProductList(res.data.content);
  //     console.log(res.data);
  //   }, (err) => {
  //     console.log(err);
  //   })
  // },
  // [NowCategory]
  // )

  const purchaseTest = () => {
    navigate(`/purchase/27`, {
      state: {
        auctionType: "P",
        // soldId: 27,
        productId: 74,
      },
    });
  };

  return (
    <div>
      <nav>
        <StyledCategoryTable>
          <StyledCategoryButton
            onClick={() => {
              setloading(true);
              setNowCategory((prev) => (prev = "??????"));
            }}
            isActive={nowCategory === "??????"}
          >
            <StyledText
              text="??????"
              size="16px"
              weight={nowCategory === "??????" ? "bold" : "0"}
            />
          </StyledCategoryButton>
          <StyledCategoryButton
            onClick={() => {
              setloading(true);
              setNowCategory((prev) => (prev = "??????"));
            }}
            isActive={nowCategory === "??????"}
          >
            <StyledText
              text="??????"
              size="16px"
              weight={nowCategory === "??????" ? "bold" : "0"}
            />
          </StyledCategoryButton>
          <StyledCategoryButton
            onClick={() => {
              setloading(true);
              setNowCategory((prev) => (prev = "?????????"));
            }}
            isActive={nowCategory === "?????????"}
          >
            <StyledText
              text="?????????"
              size="16px"
              weight={nowCategory === "?????????" ? "bold" : "0"}
            />
          </StyledCategoryButton>
          <StyledCategoryButton
            onClick={() => {
              setloading(true);
              setNowCategory((prev) => (prev = "??????"));
            }}
            isActive={nowCategory === "??????"}
          >
            <StyledText
              text="??????"
              size="16px"
              weight={nowCategory === "??????" ? "bold" : "0"}
            />
          </StyledCategoryButton>
          <StyledCategoryButton
            onClick={() => {
              setloading(true);
              setNowCategory((prev) => (prev = "??????"));
            }}
            isActive={nowCategory === "??????"}
          >
            <StyledText
              text="??????"
              size="16px"
              weight={nowCategory === "??????" ? "bold" : "0"}
            />
          </StyledCategoryButton>
        </StyledCategoryTable>
      </nav>
      <SubBanner>
        <img src={bannerImg} alt="???????????? ??????" />
      </SubBanner>
      <div
        style={{
          borderBottom: "1px solid #ebebeb",
          padding: "20px 0",
        }}
      >
        <StyledTableTitle>Most Popular</StyledTableTitle>
        <StyledTableSubtitle>?????? {nowCategory} ??????</StyledTableSubtitle>
        <HorizonScrollRowTable list={hotProductList} />
      </div>
      <div
        style={{
          borderBottom: "2px solid #ebebeb",
          padding: "20px 0",
        }}
      >
        <StyledTableTitle>New In</StyledTableTitle>
        <StyledTableSubtitle>?????? ?????? {nowCategory} ??????</StyledTableSubtitle>
        <HorizonScrollRowTable list={newProductList} />
      </div>
      <div
        style={{
          borderBottom: "2px solid #ebebeb",
          padding: "20px 0",
        }}
      >
        <StyledTableTitle>Products</StyledTableTitle>
        <StyledTableSubtitle>
          ?????? ??? ?????? {nowCategory} ??????
        </StyledTableSubtitle>
        <div
          style={{
            width: "95vw",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingTop: "10px",
          }}
        >
          <SortButton onClick={(e) => HandleSortButton()}>
            <StyledText text={sortMethod} size="14px" />
            <SortImg src={SortIcon} />
          </SortButton>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "0 5vw",
          }}
        >
          <ProductTable>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                width: "95vw",
              }}
            >
              {popularProductList.map((product, idx) => (
                <div
                  key={idx}
                  onClick={(e) => GoProductDetail(product.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    padding: "2.5vw",
                  }}
                >
                  <HalfProductCard product={product} />
                </div>
              ))}
            </div>
          </ProductTable>
        </div>
      </div>
    </div>
    // <Box margin="small">
    //   ProductListPage
    //   <button>
    //     <Link to="/productRegister">???????????? ?????? ????????????</Link>
    //   </button>
    //   <button>
    //     <Link to="/specialAuction">????????? ?????? ????????? ????????????</Link>
    //   </button>
    //   <button>
    //     <Link to="/specialProduct">????????? ?????? ?????? ????????????</Link>
    //   </button>
    //   <button>
    //     <Link to="/productDetail/39">39??? ??????</Link>
    //   </button>
    //   <button onClick={purchaseTest}>27??? ??????</button>
    // </Box>
  );
}
