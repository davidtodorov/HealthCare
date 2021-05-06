using AutoMapper;
using HealthCare.Core.Base;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace HealthCare.API.Controllers
{
    [Authorize]
    public abstract class RestController<TEntity, TModel> : ApiController
        where TEntity : IEntity
        where TModel : class
    {
        
        public RestController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            this.unitOfWork = unitOfWork;
            this.repository = GetRepository(typeof(TEntity));
            this.mapper = mapper;
        }

        [HttpGet]
        public IEnumerable<TModel> Get()
        {
            var entities = this.repository.GetAll();
            var result = mapper.Map<IEnumerable<TEntity>, IEnumerable<TModel>>(entities);
            return result.ToList();
        }

        [HttpGet("{id}")]
        public virtual TModel Get(int id)
        {
            var entity = this.repository.GetById(id);
            var result = mapper.Map<TEntity, TModel>(entity);
            return result;
        }

        [HttpPost]
        public virtual ActionResult Post(TModel requestModel)
        {
            //var entity = (TEntity)Activator.CreateInstance(typeof(TEntity), new object[] { requestModel });
            var entity = mapper.Map<TModel, TEntity>(requestModel);
            this.repository.Insert(entity);
            unitOfWork.SaveChanges();
            return Ok();
        }

        [HttpPut("{id}")]
        public virtual void Put(int id, TModel requestModel)
        {
            var entity = this.repository.GetById(id);
            mapper.Map(requestModel, entity);
            unitOfWork.SaveChanges();
        }

        [HttpDelete("{id}")]
        public virtual void Delete(int id)
        {
            this.repository.Remove(id);
            this.unitOfWork.SaveChanges();
        }

        #region private members
        private IRepository<TEntity> GetRepository(Type entityType)
        {
            foreach (var property in this.unitOfWork.GetType().GetProperties())
            {
                if (property.PropertyType.GenericTypeArguments.FirstOrDefault().Name == entityType.Name)
                {
                    return (IRepository<TEntity>)property.GetValue(unitOfWork);
                }
            }
            return null;
        }

        private readonly IRepository<TEntity> repository;
        private readonly IMapper mapper;
        protected readonly IUnitOfWork unitOfWork;
        #endregion
    }
}
