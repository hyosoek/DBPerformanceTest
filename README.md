쿼리를 GPT에 의존해서 짰더니 너무 복잡합니다.

applinace의 GET API 쿼리의 쉬운 형식은 다음과 같습니다.

(나중에 JS에서의 중복코드도 제거해야할 듯 합니다)


## Appliance GET API Query

The GET API query for retrieving appliance data based on a given account's location can be formulated as follows:

```sql
SELECT 
  subquery.energy, 
  subquery.distance
FROM (
    SELECT 
        b.energy,
        ((a.latitude - (SELECT latitude FROM account WHERE id = $1))^2 +        
        (a.longitude - (SELECT longitude FROM account WHERE id = $1))^2) as distance
    FROM 
        account a                                                              
    JOIN                                                                   
        appliance_name b 
    ON 
        a.id = b.account_id
    ORDER BY 
        ((a.latitude - (SELECT latitude FROM account WHERE id = $1))^2 +        
        (a.longitude - (SELECT longitude FROM account WHERE id = $1))^2)
    LIMIT 100 OFFSET 0
) AS subquery
ORDER BY 
    subquery.energy;
